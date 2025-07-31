'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function OfferComparisonMatrix() {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Basic</TableHead>
            <TableHead>Pro</TableHead>
            <TableHead>Enterprise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Price</TableCell>
            <TableCell>$10</TableCell>
            <TableCell>$25</TableCell>
            <TableCell>$50</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button className="mt-4">Add Feature</Button>
    </div>
  );
} 