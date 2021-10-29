// Define imports 
import axios from "axios";
import $ from "cheerio";
import moment from "moment";

import { ExecutionStatus } from "../../executor";
import DiscordWebhookPoster from "../../util/discord-webhook-poster";
import Logger from "../../util/logger";
import Command from "../command";

interface Incident {
    id: string;
    slug: string;
    color: number;
    status: string;
    description: string;
    updates: Array<IncidentUpdate>;
}

interface IncidentUpdate {
    update: string;
    postedAt: moment.Moment;
}

type ActiveIncident = Incident | null;

// Export class
export default class StatusPageMonitorCommand implements Command {

    name: string = "status_monitor";
    displayName: string = "Status monitor";
    requiredCommands: Array<string> = [];

    private statusPageUrl = "https://status.roblox.com/";
    private indicentPrefix = "statusio_incident_";
    private timeZoneOffset = 7;

    private poster: DiscordWebhookPoster;

    private lastActiveIncident: ActiveIncident = null;

    constructor() {
        this.poster = new DiscordWebhookPoster(process.env.DISCORD_WEBHOOKS?.split(",") ?? []);
    }

    async onLoad(logger: Logger): Promise<void> {
        try {
            this.lastActiveIncident = await this.getActiveIncident();
        } catch (err) {
            logger.warning(err);
        }
    }

    async execute(logger: Logger): Promise<ExecutionStatus> {
        let currentIncident: ActiveIncident = null;
        try {
            currentIncident = await this.getActiveIncident();
        } catch (err) {
            logger.warning(err);
        }

        if ((this.lastActiveIncident?.id !== currentIncident?.id ||
            this.lastActiveIncident?.updates.length !== currentIncident?.updates.length) &&
            currentIncident !== null) {
            this.postNewIncident(currentIncident);
        }

        this.lastActiveIncident = currentIncident;
        return ExecutionStatus.Success;
    }

    private async postNewIncident(incident: Incident) {
        const lastUpdate = incident.updates[incident.updates.length - 1];
        await this.poster.postEmbeds([{
            title: "Active incident",
            url: new URL(incident.slug, this.statusPageUrl).toString(),
            color: incident.color,
            fields: [
                {
                    name: "Description",
                    value: incident.description
                },
                {
                    name: "Status",
                    value: incident.status
                },
                {
                    name: "Latest update",
                    value: lastUpdate.update
                }
            ],
            timestamp: lastUpdate.postedAt.toISOString()
        }], {
            name: "Status updates"
        });
    }

    private async getActiveIncident(): Promise<ActiveIncident> {
        let response = await axios.get(this.statusPageUrl);

        return this.extractActiveIncident(response.data);
    }

    private extractActiveIncident(rawHtml: string): ActiveIncident {
        const activeIncident = $("#section_incident_active", rawHtml);
        if (activeIncident.length == 0) { return null; }

        const idElement = activeIncident.find(".incident");
        if (idElement.length == 0) { return null; }
        const id = idElement.attr().id;
        if (id === undefined || !id.startsWith(this.indicentPrefix)) { return null; }

        const panelHeadingElement = activeIncident.find(".panel-heading");
        if (panelHeadingElement.length == 0) { return null; }
        const color = parseInt(panelHeadingElement.css("background")?.substr(1) ?? "000000", 16);

        const statusElement = activeIncident.find(".incident_status_description");
        if (statusElement.length == 0) { return null; }
        const status = statusElement.text();

        const descriptionElement = statusElement.parent().find("a");
        if (descriptionElement.length == 0) { return null; }
        const description = descriptionElement.text();
        const slug = descriptionElement.attr("href");
        if (slug === undefined) { return null; }

        const updatesPanelRows = activeIncident.find(".panel-body").children().filter(function () {
            return $(this).hasClass("row") && $(this).find(".incident_time").length > 0;
        });
        const updates: Array<IncidentUpdate> = [];
        const self = this;
        updatesPanelRows.each(function () {
            const updateText = $(this).find(".incident_message_details").parent().text();
            const postedAt = moment($(this).find(".incident_time").text(), "LLL");
            // Move the timezone to the correct offset (PDT -7)
            postedAt.utcOffset(self.timeZoneOffset, true);
            updates.push({
                update: updateText,
                postedAt: postedAt
            });
        });

        return {
            id: id.substr(this.indicentPrefix.length),
            slug: slug,
            color: color,
            status: status,
            description: description,
            updates: updates
        };
    }
};