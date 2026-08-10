import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useSearch } from "@tanstack/react-router";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterBar } from "./FilterBar";
import { activeFilterCount } from "@/lib/players-filters";

export function FilterSheet({ countries }: { countries: string[] }) {
  const [open, setOpen] = useState(false);
  const search = useSearch({ from: "/players" });
  const count = activeFilterCount(search as any);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden gap-2 h-10">
          <SlidersHorizontal className="size-4" />
          Filters
          {count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gold text-black text-[10px] font-bold">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] overflow-y-auto p-4 pt-6"
      >
        <SheetHeader className="text-left mb-4 px-0">
          <SheetTitle>Filter players</SheetTitle>
        </SheetHeader>
        <FilterBar countries={countries} inSheet />
      </SheetContent>
    </Sheet>
  );
}
