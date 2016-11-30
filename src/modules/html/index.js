/**
 * toggle full screen mode
 * Created by peak on 16/8/18.
 */
export default  {
    name: "html",
    icon: "fa fa-code",
    i18n: "html view",
    show: true,
    handler (editor) {
        editor.toggleHtmlView()
    }
}
