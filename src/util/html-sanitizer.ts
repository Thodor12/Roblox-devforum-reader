export default class HtmlSanitizer {
    /**
     * Sanitizes html input to strip of HTML tags
     * @param html The input HTML string
     */
    public static Sanitize(html: string) {
        return html?.replace(/(<([^>]+)>)/gi, "");
    }
}