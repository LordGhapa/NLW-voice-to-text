import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

type NewNoteCard = { 
  onNoteCreated: (content: string) => void
}
let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCard) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')

  const [isRecording, setIsRecording] = useState<boolean>(false)

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)

    if (e.target.value === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(e?: FormEvent) {
    e?.preventDefault()
    if (content === '') return
    onNoteCreated(content)
    setContent('')
    setShouldShowOnboarding(true)

    toast.success('Nota criada com sucesso!!')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Navegador Não Suporta Tente com o chrome')
      return
    }
    setIsRecording(true)
    setShouldShowOnboarding(false)
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()
    speechRecognition.lang = 'pt-BR'
    //tem que para manualmente a api
    speechRecognition.continuous = true
    // max de opçoes de palavra transcritas
    speechRecognition.maxAlternatives = 1
    // trazendo durante fala
    speechRecognition.interimResults = true

    speechRecognition.onresult = e => {
      const transcription = Array.from(e.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')
      setContent(transcription)
    }
    speechRecognition.onerror = e => {
      console.error(e)
    }

    speechRecognition.start()
  }
  function handleStopRecording() {
    speechRecognition?.stop()
    
    setIsRecording(false)
   
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md bg-slate-700 p-5 gap-3 flex flex-col  text-left hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-200 ">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400 ">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="z-10 inset-0 md:inset-auto md:h-[60vh] overflow-hidden fixed md:left-1/2 md:top-1/2  md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full bg-slate-700 md:rounded-md flex flex-col outline-none ">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5 ">
              <span className="text-sm font-medium text-slate-300 ">
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400 ">
                  Comece{' '}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    {' '}
                    gravando uma nota
                  </button>
                  {'  '} em áudio se preferir {'  '}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-lime-400 hover:underline"
                  >
                    {' '}
                    utilize apenas textos
                  </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                onClick={handleStopRecording}
                type="button"
                className="w-full font-medium flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none hover:text-slate-100"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse " />{' '}
                Gravando! (Click p/ Interromper)
              </button>
            ) : (
              content && (
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="w-full font-medium  bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none hover:bg-lime-500"
                >
                  Salvar nota
                </button>
              )
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
