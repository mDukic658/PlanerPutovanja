import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { FaItalic, FaBold, FaUnderline, FaStrikethrough, FaListUl, FaListOl, FaUndo, FaRedo, FaLink, FaUnlink } from "react-icons/fa"
import "./RichTextEditor.css"

export default function RichTextEditor({
    value = "",
    onChange,
    disabled = false
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: {
                    openOnClick: false,
                    autolink: true,
                    defaultProtocol: "https"
                }
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"]
            })
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.isEmpty ? "" : editor.getHTML())
        }
    })

    useEffect(() => {
        if (!editor) return

        const current = editor.isEmpty ? "" : editor.getHTML()

        if (value !== current) {
            editor.commands.setContent(value || "", {
                emitUpdate: false
            })
        }
    }, [editor, value])

    useEffect(() => {
        editor?.setEditable(!disabled)
    }, [editor, disabled])

    if (!editor) return null

    function postaviPoveznicu() {
        const prethodna = editor.getAttributes("link").href || ""
        const url = window.prompt("Unesi URL poveznice:", prethodna)

        if (url === null) return

        if (!url.trim()) {
            editor.chain().focus().unsetLink().run()
            return
        }

        editor.chain().focus().setLink({ href: url.trim() }).run()
    }

    const alatke = [
        { naziv: "Podebljano", ikona: FaBold, akcija: () => editor.chain().focus().toggleBold().run(), aktivno: editor.isActive("bold") },
        { naziv: "Kurziv", ikona: FaItalic, akcija: () => editor.chain().focus().toggleItalic().run(), aktivno: editor.isActive("italic") },
        { naziv: "Podcrtano", ikona: FaUnderline, akcija: () => editor.chain().focus().toggleUnderline().run(), aktivno: editor.isActive("underline") },
        { naziv: "Precrtano", ikona: FaStrikethrough, akcija: () => editor.chain().focus().toggleStrike().run(), aktivno: editor.isActive("strike") },
        { naziv: "Obična lista", ikona: FaListUl, akcija: () => editor.chain().focus().toggleBulletList().run(), aktivno: editor.isActive("bulletList") },
        { naziv: "Numerirana lista", ikona: FaListOl, akcija: () => editor.chain().focus().toggleOrderedList().run(), aktivno: editor.isActive("orderedList") },
        { naziv: "Poveznica", ikona: FaLink, akcija: postaviPoveznicu, aktivno: editor.isActive("link") },
        { naziv: "Ukloni poveznicu", ikona: FaUnlink, akcija: () => editor.chain().focus().unsetLink().run(), aktivno: false },
        { naziv: "Poništi", ikona: FaUndo, akcija: () => editor.chain().focus().undo().run(), aktivno: false },
        { naziv: "Vrati", ikona: FaRedo, akcija: () => editor.chain().focus().redo().run(), aktivno: false }
    ]

    return (
        <div className="rich-text-editor">
            <div className="rich-text-toolbar">
                <ButtonGroup size="sm" className="flex-wrap">
                    {alatke.map(({ naziv, ikona: Ikona, akcija, aktivno }) => (
                        <Button
                            key={naziv}
                            type="button"
                            variant={aktivno ? "primary" : "outline-secondary"}
                            title={naziv}
                            aria-label={naziv}
                            aria-pressed={aktivno}
                            disabled={disabled}
                            onClick={akcija}
                        >
                            <Ikona />
                        </Button>
                    ))}
                </ButtonGroup>
            </div>

            <EditorContent editor={editor} />
        </div>
    )
}