import { useEditor, EditorContent, Mark, Node, mergeAttributes } from '@tiptap/react';
import { wrapIn, lift } from '@tiptap/pm/commands';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Square,
  BookOpen,
  Loader2,
  Upload,
  ScanText,
  Highlighter,
  Type,
  RemoveFormatting,
  EyeOff,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Custom underline extension with style support
const CustomUnderline = Mark.create({
  name: 'customUnderline',
  addAttributes() {
    return {
      style: {
        default: 'solid',
        parseHTML: element => element.getAttribute('data-underline-style') || 'solid',
        renderHTML: attributes => ({
          'data-underline-style': attributes.style,
        }),
      },
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-underline-color'),
        renderHTML: attributes => ({
          'data-underline-color': attributes.color,
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-underline]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes['data-underline-style'] || 'solid';
    const color = HTMLAttributes['data-underline-color'] || 'currentColor';
    let textDecoration = 'underline';
    if (style === 'dashed') textDecoration = 'underline dashed';
    if (style === 'wavy') textDecoration = 'underline wavy';
    
    return ['span', mergeAttributes(HTMLAttributes, {
      'data-underline': 'true',
      style: `text-decoration: ${textDecoration}; text-decoration-color: ${color};`,
    }), 0];
  },
});

// Custom frame/border block extension
const FrameBlock = Node.create({
  name: 'frameBlock',
  group: 'block',
  content: 'block+',
  defining: true,
  
  addAttributes() {
    return {
      borderStyle: {
        default: 'solid',
        parseHTML: element => element.getAttribute('data-border-style') || 'solid',
        renderHTML: attributes => ({
          'data-border-style': attributes.borderStyle,
        }),
      },
      borderColor: {
        default: '#000000',
        parseHTML: element => element.getAttribute('data-border-color') || '#000000',
        renderHTML: attributes => ({
          'data-border-color': attributes.borderColor,
        }),
      },
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-frame-block]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes['data-border-style'] || 'solid';
    const color = HTMLAttributes['data-border-color'] || '#000000';
    
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-frame-block': 'true',
      style: `border: 2px ${style} ${color}; padding: 12px; margin: 8px 0; border-radius: 4px;`,
    }), 0];
  },
});

// Custom definition node for dictionary lookups (inline)
const DefinitionNode = Node.create({
  name: 'definition',
  group: 'inline',
  inline: true,
  atom: true,
  
  addAttributes() {
    return {
      text: {
        default: '',
      },
    };
  },
  
  parseHTML() {
    return [{ 
      tag: 'span.inline-definition',
      getAttrs: (node) => {
        if (typeof node === 'string') return false;
        return { text: node.textContent || '' };
      },
    }];
  },
  
  renderHTML({ node }) {
    return ['span', { class: 'inline-definition', title: 'Click to remove' }, node.attrs.text];
  },
});

// Vocabulary summary block node
const VocabSummary = Node.create({
  name: 'vocabSummary',
  group: 'block',
  content: 'block+',
  defining: true,
  
  parseHTML() {
    return [{ tag: 'div.vocab-summary' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, class: 'vocab-summary' }, 0];
  },
});

// Toggle/spoiler mark extension for hiding text
const ToggleMark = Mark.create({
  name: 'toggle',
  
  addAttributes() {
    return {
      hidden: {
        default: true,
        parseHTML: element => element.getAttribute('data-hidden') === 'true',
        renderHTML: attributes => ({
          'data-hidden': attributes.hidden ? 'true' : 'false',
        }),
      },
    };
  },
  
  parseHTML() {
    return [{ tag: 'span[data-toggle]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    const isHidden = HTMLAttributes['data-hidden'] === 'true';
    return ['span', mergeAttributes(HTMLAttributes, {
      'data-toggle': 'true',
      class: isHidden ? 'toggle-hidden' : 'toggle-visible',
      title: 'Click to toggle visibility',
    }), 0];
  },
});

// Font size extension with line height
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace('px', ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}px` };
        },
      },
      lineHeight: {
        default: null,
        parseHTML: element => element.style.lineHeight,
        renderHTML: attributes => {
          if (!attributes.lineHeight) return {};
          return { style: `line-height: ${attributes.lineHeight}` };
        },
      },
    };
  },
});

const FONT_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42];

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'OpenDyslexic', label: 'OpenDyslexic' },
];

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; imageSrc: string } | null>(null);
  const [frameBorderStyle, setFrameBorderStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [frameBorderColor, setFrameBorderColor] = useState('#000000');
  const { toast } = useToast();

  const performOcrOnUrl = async (imageUrl: string) => {
    if (!editor) return;
    
    setIsOcrProcessing(true);
    toast({
      title: "Processing OCR",
      description: "Loading OCR engine, this may take a moment...",
    });

    try {
      const Tesseract = await import('tesseract.js');
      
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      if (text && text.trim()) {
        editor.chain().focus().insertContent(text.trim()).run();
        onChange(editor.getHTML());
        
        toast({
          title: "OCR Complete",
          description: "Text extracted and inserted successfully",
        });
      } else {
        toast({
          title: "No text found",
          description: "Could not extract text from this image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: "OCR Failed",
        description: "Failed to extract text from image",
        variant: "destructive",
      });
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const performOcr = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      const imageUrl = URL.createObjectURL(file);
      await performOcrOnUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);
    };
    input.click();
  };

  const handleImageContextMenu = (imageSrc: string) => {
    setContextMenu(null);
    performOcrOnUrl(imageSrc);
  };

  // Dictionary lookup with multiple sources
  const lookupFromFreeDictionary = async (word: string): Promise<string[] | null> => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const entry = data[0];
      const definitionParts: string[] = [];
      
      entry.meanings?.slice(0, 2).forEach((meaning: any) => {
        meaning.definitions?.slice(0, 1).forEach((def: any) => {
          let part = `${meaning.partOfSpeech}: ${def.definition}`;
          if (def.example) {
            part += ` "${def.example}"`;
          }
          definitionParts.push(part);
        });
      });
      
      return definitionParts.length > 0 ? definitionParts : null;
    } catch {
      return null;
    }
  };

  const lookupFromWiktionary = async (word: string): Promise<string[] | null> => {
    try {
      const response = await fetch(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
      );
      if (!response.ok) return null;
      
      const data = await response.json();
      const definitionParts: string[] = [];
      
      // Parse Wiktionary response
      if (data.en) {
        data.en.slice(0, 2).forEach((entry: any) => {
          entry.definitions?.slice(0, 1).forEach((def: any) => {
            // Strip HTML tags from definition
            const cleanDef = def.definition?.replace(/<[^>]*>/g, '') || '';
            if (cleanDef) {
              definitionParts.push(`${entry.partOfSpeech}: ${cleanDef}`);
            }
          });
        });
      }
      
      return definitionParts.length > 0 ? definitionParts : null;
    } catch {
      return null;
    }
  };


  const lookupWord = async () => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ').trim();
    
    if (!selectedText) {
      toast({
        title: "No text selected",
        description: "Please select a word to look up its definition",
        variant: "destructive",
      });
      return;
    }

    // Get just the first word if multiple words selected
    const word = selectedText.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
    
    if (!word) {
      toast({
        title: "Invalid selection",
        description: "Please select a valid word",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUp(true);
    
    try {
      // Try multiple dictionary sources in order
      let definitionParts: string[] | null = null;
      let sourceUsed = '';
      
      // Try Free Dictionary first
      definitionParts = await lookupFromFreeDictionary(word);
      if (definitionParts) {
        sourceUsed = 'Free Dictionary';
      }
      
      // Fallback to Wiktionary
      if (!definitionParts) {
        definitionParts = await lookupFromWiktionary(word);
        if (definitionParts) {
          sourceUsed = 'Wiktionary';
        }
      }
      
      
      if (!definitionParts || definitionParts.length === 0) {
        throw new Error("Word not found in any dictionary");
      }
      
      const definitionText = `[${definitionParts.join(' | ')}]`;
      
      // Insert definition node right after the selected word
      editor.chain().focus().insertContentAt(to, {
        type: 'definition',
        attrs: { text: ` ${definitionText}` },
      }).run();
      
      // Add/update vocabulary summary at the end
      const currentHtml = editor.getHTML();
      const vocabEntry = `<li><strong>${word}</strong>: ${definitionParts.join('; ')}</li>`;
      
      if (currentHtml.includes('class="vocab-summary"')) {
        // Update existing summary - add new word to the list
        const updatedHtml = currentHtml.replace(
          /(<div class="vocab-summary">[\s\S]*?<ul>)([\s\S]*?)(<\/ul>[\s\S]*?<\/div>)/,
          `$1$2${vocabEntry}$3`
        );
        editor.commands.setContent(updatedHtml);
      } else {
        // Create new summary at the end
        const summaryHtml = `<div class="vocab-summary"><h4>📚 Vocabulary Summary</h4><ul>${vocabEntry}</ul></div>`;
        editor.commands.setContent(currentHtml + summaryHtml);
      }
      
      onChange(editor.getHTML());
      
      toast({
        title: "Definition added",
        description: `"${word}" found via ${sourceUsed}`,
      });
    } catch (error) {
      toast({
        title: "Lookup failed",
        description: "Could not find definition in any dictionary",
        variant: "destructive",
      });
    } finally {
      setIsLookingUp(false);
    }
  };
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      Underline,
      CustomUnderline,
      FrameBlock,
      DefinitionNode,
      VocabSummary,
      ToggleMark,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto cursor-pointer rounded-lg',
          style: 'max-height: 200px; width: auto;',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[calc(100vh-400px)] px-0',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const handleEditorClick = (e: MouseEvent) => {
      // Close context menu on any click
      setContextMenu(null);
      
      const target = e.target as HTMLElement;
      
      // Handle image expansion
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        setExpandedImage(img.src);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      // Handle toggle visibility click
      if (target.hasAttribute('data-toggle') || target.closest('[data-toggle]')) {
        const toggleElement = target.hasAttribute('data-toggle') ? target : target.closest('[data-toggle]');
        if (toggleElement) {
          const isHidden = toggleElement.getAttribute('data-hidden') === 'true';
          toggleElement.setAttribute('data-hidden', isHidden ? 'false' : 'true');
          toggleElement.className = isHidden ? 'toggle-visible' : 'toggle-hidden';
          onChange(editor.getHTML());
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
      
      // Handle definition removal (click to remove)
      if (target.classList.contains('inline-definition') || target.closest('.inline-definition')) {
        const defElement = target.classList.contains('inline-definition') ? target : target.closest('.inline-definition');
        if (defElement) {
          defElement.remove();
          onChange(editor.getHTML());
          toast({
            title: "Definition removed",
          });
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === 'IMG') {
        e.preventDefault();
        const img = target as HTMLImageElement;
        setContextMenu({ x: e.clientX, y: e.clientY, imageSrc: img.src });
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleEditorClick);
    editorElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      editorElement.removeEventListener('click', handleEditorClick);
      editorElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [editor, onChange, toast]);

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addImageFromFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast({
              title: "Error",
              description: "You must be logged in to upload images",
              variant: "destructive",
            });
            return;
          }

          // Create unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('note-images')
            .upload(fileName, file);

          if (uploadError) {
            throw uploadError;
          }

          // Get signed URL (private bucket)
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('note-images')
            .createSignedUrl(fileName, 31536000); // 1 year expiry

          if (urlError) throw urlError;

          // Insert image into editor
          editor.chain().focus().setImage({ src: signedUrlData.signedUrl }).run();

          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Error",
            description: "Failed to upload image",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  if (!editor) {
    return null;
  }

  const applyUnderline = (style: 'solid' | 'dashed' | 'wavy', color: string) => {
    if (!editor) return;
    editor.chain().focus().setMark('customUnderline', { style, color }).run();
  };

  const removeUnderline = () => {
    if (!editor) return;
    editor.chain().focus().unsetMark('customUnderline').run();
  };

  const applyFrame = (borderStyle: 'solid' | 'dashed' | 'dotted', borderColor: string) => {
    if (!editor) return;
    
    // Refocus editor first to ensure selection is available
    editor.commands.focus();
    
    const { state, view } = editor;
    const nodeType = state.schema.nodes.frameBlock;
    if (!nodeType) return;
    
    // Check if cursor is already inside a frameBlock — update its attributes
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === 'frameBlock') {
        const pos = $from.before(depth);
        view.dispatch(state.tr.setNodeMarkup(pos, undefined, { borderStyle, borderColor }));
        return;
      }
    }
    
    // Otherwise wrap in a new frame
    const command = wrapIn(nodeType, { borderStyle, borderColor });
    command(state, view.dispatch);
  };

  const removeFrame = () => {
    if (!editor) return;
    const { state, view } = editor;
    lift(state, view.dispatch);
  };

  const applyToggle = () => {
    if (!editor) return;
    if (editor.isActive('toggle')) {
      editor.chain().focus().unsetMark('toggle').run();
    } else {
      editor.chain().focus().setMark('toggle', { hidden: true }).run();
    }
  };

  return (
    <div className="space-y-4 relative">
      <div className="border border-border rounded-lg p-2 bg-card flex flex-wrap gap-1 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={editor.isActive('customUnderline') ? 'bg-accent' : ''}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-3">
              <p className="text-sm font-medium">Line Style</p>
              <div className="flex gap-2">
                {(['solid', 'dashed', 'wavy'] as const).map((style) => (
                  <Button
                    key={style}
                    variant="outline"
                    size="sm"
                    className="flex-1 capitalize"
                    onClick={() => applyUnderline(style, '#000000')}
                  >
                    <span style={{ textDecoration: `underline ${style}` }}>{style}</span>
                  </Button>
                ))}
              </div>
              <p className="text-sm font-medium">Line Color</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#000000',
                  '#ef4444',
                  '#f97316',
                  '#f59e0b',
                  '#22c55e',
                  '#3b82f6',
                  '#6366f1',
                  '#8b5cf6',
                  '#ec4899',
                  '#14b8a6',
                  '#06b6d4',
                  '#64748b',
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const currentStyle = editor.getAttributes('customUnderline').style || 'solid';
                      applyUnderline(currentStyle, color);
                    }}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={removeUnderline}
              >
                Remove Underline
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={editor.isActive('frameBlock') ? 'bg-accent' : ''}
            >
              <Square className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-3">
              <p className="text-sm font-medium">Frame Style</p>
              <div className="flex gap-2">
                {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                  <Button
                    key={style}
                    variant={frameBorderStyle === style ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 capitalize"
                    onClick={() => {
                      setFrameBorderStyle(style);
                      applyFrame(style, frameBorderColor);
                    }}
                  >
                    <span style={{ borderBottom: `2px ${style} currentColor`, paddingBottom: '2px' }}>{style}</span>
                  </Button>
                ))}
              </div>
              <p className="text-sm font-medium">Frame Color</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#000000',
                  '#ef4444',
                  '#f97316',
                  '#f59e0b',
                  '#22c55e',
                  '#3b82f6',
                  '#6366f1',
                  '#8b5cf6',
                  '#ec4899',
                  '#14b8a6',
                  '#06b6d4',
                  '#64748b',
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setFrameBorderColor(color);
                      applyFrame(frameBorderStyle, color);
                    }}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={removeFrame}
              >
                Remove Frame
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="w-px h-8 bg-border" />
        <Select
          value={editor.getAttributes('textStyle').fontSize || ''}
          onValueChange={(value) => {
            if (value) {
              editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
            } else {
              editor.chain().focus().unsetMark('textStyle').run();
            }
          }}
        >
          <SelectTrigger className="w-[70px] h-8">
            <SelectValue placeholder={<Type className="h-4 w-4" />} />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={editor.getAttributes('textStyle').fontFamily || ''}
          onValueChange={(value) => {
            if (value) {
              editor.chain().focus().setFontFamily(value).run();
            } else {
              editor.chain().focus().unsetFontFamily().run();
            }
          }}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border" />
        <Button variant="ghost" size="sm" onClick={addLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addImageFromFile} title="Upload image file">
          <Upload className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={performOcr} 
          disabled={isOcrProcessing}
          title="OCR - Extract text from image"
        >
          {isOcrProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanText className="h-4 w-4" />}
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Insert image from URL">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={addImage}>
                Insert from URL
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="w-px h-8 bg-border" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <div
                className="w-5 h-5 rounded border border-border"
                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Text Color</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#000000',
                  '#ef4444',
                  '#f97316',
                  '#f59e0b',
                  '#eab308',
                  '#84cc16',
                  '#22c55e',
                  '#10b981',
                  '#14b8a6',
                  '#06b6d4',
                  '#0ea5e9',
                  '#3b82f6',
                  '#6366f1',
                  '#8b5cf6',
                  '#a855f7',
                  '#d946ef',
                  '#ec4899',
                  '#f43f5e',
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Reset Color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="w-px h-8 bg-border" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" title="Highlight text">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Highlight Color</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#fef08a', '#fde047', '#facc15',
                  '#bef264', '#a3e635', '#86efac',
                  '#67e8f9', '#7dd3fc', '#93c5fd',
                  '#c4b5fd', '#d8b4fe', '#f0abfc',
                  '#fda4af', '#fb7185', '#fca5a1',
                  '#fed7aa', '#fdba74', '#fb923c',
                ].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                Remove Highlight
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <div className="w-px h-8 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={lookupWord}
          disabled={isLookingUp}
          title="Look up definition"
        >
          {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={applyToggle}
          className={editor.isActive('toggle') ? 'bg-accent' : ''}
          title="Toggle hide/show selected text"
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
      
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-[80vw] max-h-[80vh] p-2">
          {expandedImage && (
            <img 
              src={expandedImage} 
              alt="Expanded view" 
              className="w-full h-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Image context menu */}
      {contextMenu && (
        <div
          className="fixed bg-popover border border-border rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2 disabled:opacity-50"
            onClick={() => handleImageContextMenu(contextMenu.imageSrc)}
            disabled={isOcrProcessing}
          >
            {isOcrProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanText className="h-4 w-4" />}
            Extract text (OCR)
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
            onClick={() => {
              setExpandedImage(contextMenu.imageSrc);
              setContextMenu(null);
            }}
          >
            <ImageIcon className="h-4 w-4" />
            View full size
          </button>
        </div>
      )}
    </div>
  );
};
