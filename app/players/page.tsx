/**
 * Players Page - Server Component with Client Component filters
 * 
 * Displays all players with filtering capabilities
 */

import { getAllPlayers } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { PlayerRole, PlayerStatus } from '@/lib/types';

// Role badge color mapping
function getRoleBadgeVariant(role: PlayerRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'Batsman':
      return 'default';
    case 'Bowler':
      return 'secondary';
    case 'All-Rounder':
      return 'outline';
    case 'Wicket-Keeper':
      return 'default';
    default:
      return 'outline';
  }
}

// Status badge color mapping
function getStatusBadgeVariant(status: PlayerStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'Sold':
      return 'secondary';
    case 'Live':
      return 'destructive';
    case 'Unsold':
      return 'default';
    default:
      return 'default';
  }
}

export default function PlayersPage() {
  const players = getAllPlayers();

  // Group players by status
  const soldPlayers = players.filter((p) => p.status === 'Sold');
  const livePlayers = players.filter((p) => p.status === 'Live');
  const unsoldPlayers = players.filter((p) => p.status === 'Unsold');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Players</h1>
        <p className="text-muted-foreground mt-2">
          Browse all players in the auction pool
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{unsoldPlayers.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Unsold</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{livePlayers.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Live Auction</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{soldPlayers.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Sold</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players Grid View */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        {players.map((player) => (
          <Card key={player.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="h-16 w-16 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.nationality} · {player.age}y
                  </p>
                  <div className="flex gap-1 mt-2">
                    <Badge variant={getRoleBadgeVariant(player.role)} className="text-xs">
                      {player.role}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(player.status)} className="text-xs">
                      {player.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    {player.status === 'Sold' && player.soldPrice ? (
                      <p className="text-sm font-semibold text-primary">
                        Sold: {formatCurrency(player.soldPrice)}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Base: {formatCurrency(player.basePrice)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Players Table View */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sold Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(player.role)}>
                      {player.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{player.nationality}</TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>{formatCurrency(player.basePrice)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(player.status)}>
                      {player.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {player.soldPrice ? formatCurrency(player.soldPrice) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
