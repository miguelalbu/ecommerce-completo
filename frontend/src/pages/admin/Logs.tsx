import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLogs, getUsuariosComLogs } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ENTIDADES = [
  { value: 'all', label: 'Todas as Entidades' },
  { value: 'PRODUTO', label: 'Produtos' },
  { value: 'CATEGORIA', label: 'Categorias' },
  { value: 'SUBCATEGORIA', label: 'Subcategorias' },
  { value: 'MARCA', label: 'Marcas' },
  { value: 'PEDIDO', label: 'Pedidos' },
];

const ACAO_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CREATE_PRODUCT:   { label: 'Novo Produto',     variant: 'default' },
  UPDATE_PRODUCT:   { label: 'Editou Produto',   variant: 'secondary' },
  DELETE_PRODUCT:   { label: 'Removeu Produto',  variant: 'destructive' },
  CREATE_CATEGORY:  { label: 'Nova Categoria',   variant: 'default' },
  UPDATE_CATEGORY:  { label: 'Editou Categoria', variant: 'secondary' },
  DELETE_CATEGORY:  { label: 'Removeu Categoria',variant: 'destructive' },
  CREATE_SUBCATEGORY: { label: 'Nova Subcategoria', variant: 'default' },
  DELETE_SUBCATEGORY: { label: 'Removeu Subcategoria', variant: 'destructive' },
  CREATE_BRAND:     { label: 'Nova Marca',       variant: 'default' },
  UPDATE_BRAND:     { label: 'Editou Marca',     variant: 'secondary' },
  DELETE_BRAND:     { label: 'Removeu Marca',    variant: 'destructive' },
  CREATE_ORDER:     { label: 'Venda Balcão',     variant: 'default' },
  UPDATE_ORDER:     { label: 'Editou Pedido',    variant: 'secondary' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const Logs = () => {
  const { token } = useAuth();
  const [selectedUsuario, setSelectedUsuario] = useState('all');
  const [selectedEntidade, setSelectedEntidade] = useState('all');
  const [page, setPage] = useState(1);

  const { data: usuarios } = useQuery({
    queryKey: ['log-usuarios'],
    queryFn: () => getUsuariosComLogs(token!),
    enabled: !!token,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['logs', selectedUsuario, selectedEntidade, page],
    queryFn: () => getLogs(token!, {
      usuarioId: selectedUsuario !== 'all' ? selectedUsuario : undefined,
      entidade: selectedEntidade !== 'all' ? selectedEntidade : undefined,
      page,
      limit: 50,
    }),
    enabled: !!token,
  });

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Logs de Atividade</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedUsuario} onValueChange={handleFilterChange(setSelectedUsuario)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Usuários</SelectItem>
            {usuarios?.map((u: any) => (
              <SelectItem key={u.id} value={u.id}>{u.nome} ({u.funcao})</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEntidade} onValueChange={handleFilterChange(setSelectedEntidade)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por entidade" />
          </SelectTrigger>
          <SelectContent>
            {ENTIDADES.map(e => (
              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(selectedUsuario !== 'all' || selectedEntidade !== 'all') && (
          <Button variant="outline" onClick={() => { setSelectedUsuario('all'); setSelectedEntidade('all'); setPage(1); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registro de Ações</span>
            {data && <span className="text-sm font-normal text-muted-foreground">{data.total} registros</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando logs...</p>
          ) : !data?.logs?.length ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum registro encontrado.</p>
          ) : (
            <>
              <div className="space-y-2">
                {data.logs.map((log: any) => {
                  const acao = ACAO_LABELS[log.acao] ?? { label: log.acao, variant: 'outline' as const };
                  return (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-shrink-0 pt-0.5">
                        <Badge variant={acao.variant}>{acao.label}</Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{log.descricao}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-muted-foreground">{log.usuarioNome}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{formatDate(log.criadoEm)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginação */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button variant="outline" size="icon" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {data.totalPages}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
