import React from "react"
import { Box, Typography, Button } from "@mui/material"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { format } from 'date-fns';
import { TaxSaleOfSecurity } from "../calculator";

export type SaleOfSecuritiesTableProps = {
    transactions: TaxSaleOfSecurity[],
    onDownload: () => unknown,
}

export const SaleOfSecuritiesTable: React.FC<SaleOfSecuritiesTableProps> = ({
    transactions,
    onDownload
}) => {

const accountName = (row: TaxSaleOfSecurity) => row.isESPP ? 'EAC': 'Individual';

return <Box>
    <Box display='flex' sx={{
        justifyContent: 'space-between',
        mb: 1
    }}>
        <Typography variant="h5" textAlign="left" component='span'>Sales within the period</Typography>
        <Button variant="text" size="small" startIcon={<DownloadRoundedIcon/>} onClick={onDownload}>Download</Button>
    </Box>
    <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
            <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Purchase Date</TableCell>
                <TableCell align="right">Sale Date</TableCell>
                <TableCell align="right">Purchase Price (EUR)</TableCell>
                <TableCell align="right">Sale Price (EUR)</TableCell>
                <TableCell align="right">Sale Fees (EUR)</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Capital Loss</TableCell>
                <TableCell align="right">Capital Gain</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {transactions.map((row, index) => (
                <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                <TableCell>{accountName(row)}</TableCell>
                <TableCell component="th" scope="row">
                    {row.symbol}
                </TableCell>
                <TableCell align="right">{format(row.purchaseDate, 'yyyy-MM-dd')}</TableCell>
                <TableCell align="right">{format(row.saleDate, 'yyyy-MM-dd')}</TableCell>
                <TableCell align="right">{row.purchasePriceEUR.toFixed(2)}</TableCell>
                <TableCell align="right">{row.salePriceEUR.toFixed(2)}</TableCell>
                <TableCell align="right">{row.saleFeesEUR.toFixed(2)}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">{row.capitalLossEUR.toFixed(2)}</TableCell>
                <TableCell align="right">{row.capitalGainEUR.toFixed(2)}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
    </TableContainer>
</Box>
};