/**
 * Teams Page - Server Component
 * 
 * Displays all teams with their purse, players, and statistics
 */

import { getAllTeams } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Users, DollarSign, ShoppingCart } from 'lucide-react';

export default function TeamsPage() {
  const teams = getAllTeams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Teams</h1>
        <p className="text-muted-foreground mt-2">
          All participating teams and their squad details
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const purseUsed = team.totalPurse - team.remainingPurse;
          const pursePercentage = (purseUsed / team.totalPurse) * 100;

          return (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <img src={team.logo} alt={team.name} className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <CardDescription>{team.shortName}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Purse Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">Purse</span>
                      </div>
                      <span className="text-sm font-semibold">{formatCurrency(team.remainingPurse)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${100 - pursePercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(purseUsed)} spent of {formatCurrency(team.totalPurse)}
                    </p>
                  </div>

                  {/* Player Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Players</span>
                    </div>
                    <Badge variant="secondary">
                      {team.players.length} / {team.maxPlayers}
                    </Badge>
                  </div>

                  {/* Players List */}
                  {team.players.length > 0 ? (
                    <div className="border rounded-lg p-3">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Squad
                      </p>
                      <div className="space-y-2">
                        {team.players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{player.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {player.role}
                              </Badge>
                              <span className="font-semibold text-xs">
                                {formatCurrency(player.soldPrice || 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-3 text-center">
                      <p className="text-sm text-muted-foreground">No players yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Teams Table View */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Teams Overview</CardTitle>
          <CardDescription>Quick comparison of all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Purse Used</TableHead>
                <TableHead>Purse Remaining</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => {
                const purseUsed = team.totalPurse - team.remainingPurse;
                const canBid = team.remainingPurse > 0.5; // Minimum bid amount

                return (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img src={team.logo} alt={team.name} className="h-8 w-8 rounded-full" />
                        <div>
                          <p className="font-medium">{team.shortName}</p>
                          <p className="text-xs text-muted-foreground">{team.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {team.players.length} / {team.maxPlayers}
                    </TableCell>
                    <TableCell>{formatCurrency(purseUsed)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(team.remainingPurse)}</TableCell>
                    <TableCell>
                      {canBid ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Low Purse</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
