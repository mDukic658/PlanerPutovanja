import DOMPurify from "dompurify"
import "./RichTextEditor.css"

export default function RichTextPrikaz({ html = "" }) {
    if (!html) return null

    const siguranHtml = DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true }
    })

    return (
        <div
            className="rich-text-prikaz"
            dangerouslySetInnerHTML={{ __html: siguranHtml }}
        />
    )
}