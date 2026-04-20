"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { value: string; label: string; keywords?: Array<string | null | undefined> }[];
  onChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  title?: string;
  className?: string;
}

export function Combobox({ 
  options, 
  onChange, 
  defaultValue, 
  placeholder = "Selecione...", 
  title, 
  className 
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue || "")

  React.useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {/* Se houver um título e nenhum valor, mostra o título */}
          {value ? options.find((opt) => opt.value === value)?.label ?? value : (title || placeholder)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const normalizedKeywords = (opt.keywords || [])
                  .map(keyword => (keyword ?? '').toString().trim())
                  .filter(Boolean)

                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    keywords={normalizedKeywords}
                    onSelect={() => {
                      const newValue = opt.value === value ? "" : opt.value;
                      setValue(newValue);
                      onChange(newValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}