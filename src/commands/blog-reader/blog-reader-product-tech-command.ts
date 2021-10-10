// Define imports
import ReadBlogCommand from "./blog-reader-command";

// Export class
export default class BlogReaderProductTechCommand extends ReadBlogCommand {

    name: string = "blog_reader_product_tech";
    displayName: string = "Blog - Product & Tech";
    categoryId: number = 5;
    hexColor: string = "0D6EFD";

}