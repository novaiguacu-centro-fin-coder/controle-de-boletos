import { FileDown } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { getUnits } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const units = await getUnits();
  return <div className="space-y-6 p-4 md:p-7"><PageTitle title="Relatórios" description="Exporte os pagamentos com os filtros necessários para conferência." />
    <Card className="max-w-4xl"><CardHeader><CardTitle>Exportar pagamentos</CardTitle></CardHeader><CardContent><form action="/api/admin/export" method="get" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="space-y-2"><Label htmlFor="from">Data inicial</Label><Input id="from" name="from" type="date" /></div><div className="space-y-2"><Label htmlFor="to">Data final</Label><Input id="to" name="to" type="date" /></div><div className="space-y-2"><Label htmlFor="unit">Unidade</Label><NativeSelect id="unit" name="unit" className="w-full"><NativeSelectOption value="">Todas</NativeSelectOption>{units.map((unit) => <NativeSelectOption key={unit.id} value={unit.id}>{unit.name}</NativeSelectOption>)}</NativeSelect></div><div className="space-y-2"><Label htmlFor="method">Forma</Label><NativeSelect id="method" name="method" className="w-full"><NativeSelectOption value="">Todas</NativeSelectOption><NativeSelectOption value="BOLETO">Boleto</NativeSelectOption><NativeSelectOption value="PIX">PIX</NativeSelectOption><NativeSelectOption value="CARTAO">Cartão</NativeSelectOption></NativeSelect></div><div className="space-y-2"><Label htmlFor="status">Status</Label><NativeSelect id="status" name="status" className="w-full"><NativeSelectOption value="">Todos</NativeSelectOption>{["VALIDADO","LIBERADO","DUPLICADO","EXCECAO","BAIXADO"].map((status) => <NativeSelectOption key={status} value={status}>{status}</NativeSelectOption>)}</NativeSelect></div><div className="space-y-2"><Label htmlFor="format">Formato</Label><NativeSelect id="format" name="format" defaultValue="xlsx" className="w-full"><NativeSelectOption value="xlsx">Excel (.xlsx)</NativeSelectOption><NativeSelectOption value="csv">CSV</NativeSelectOption></NativeSelect></div><div className="flex items-end sm:col-span-2"><Button className="w-full sm:w-auto"><FileDown />Gerar arquivo</Button></div></form></CardContent></Card>
  </div>;
}
