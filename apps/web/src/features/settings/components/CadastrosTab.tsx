import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ClientsTab } from './ClientsTab';
import { ProjectsTab } from './ProjectsTab';
import { ResourcesTab } from './ResourcesTab';

export function CadastrosTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastros do Sistema</CardTitle>
        <CardDescription>
          Gerencie de forma centralizada os clientes, projetos e recursos do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="clientes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="projetos">Projetos</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="clientes" className="outline-none">
            <ClientsTab />
          </TabsContent>

          <TabsContent value="projetos" className="outline-none">
            <ProjectsTab />
          </TabsContent>

          <TabsContent value="recursos" className="outline-none">
            <ResourcesTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
