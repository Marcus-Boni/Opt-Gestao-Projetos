import { Check, Edit3 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type Props = {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isPrintMode?: boolean;
};

export function EditableSection({
  title,
  value,
  onChange,
  placeholder = 'Clique em editar para adicionar conteúdo…',
  className,
  isPrintMode = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function handleSave() {
    onChange(draft);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(value);
    setIsEditing(false);
  }

  return (
    <div className={cn('rounded-lg border bg-card p-5', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {!isPrintMode && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(value);
              setIsEditing(true);
            }}
            aria-label={`Editar ${title}`}
          >
            <Edit3 className="mr-1.5 size-3.5" />
            Editar
          </Button>
        )}
        {!isPrintMode && isEditing && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="mr-1.5 size-3.5" />
              Salvar
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={draft}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-h-[160px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-sans text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <div className="min-h-[80px]">
          {value ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{value}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">{placeholder}</p>
          )}
        </div>
      )}
    </div>
  );
}
