import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { calculateTaxes, EACTransaction, IndividualTransaction } from './calculator';
import { format } from 'date-fns';
import { ECBConverter } from './ecbRates';

export type ResultsProps = {
    individualHistory: IndividualTransaction[];
    eacHistory: EACTransaction[];
    ecbConverter: ECBConverter;
}

export const Results: React.FC<ResultsProps> = ({
    individualHistory,
    eacHistory,
    ecbConverter
}) => {

    const taxReport = calculateTaxes(individualHistory, eacHistory, ecbConverter);
    console.debug('TAXES', taxReport);

    return (
        <Card>
            <CardContent>
                <Typography textAlign={'center'} variant={'h4'} gutterBottom>Results</Typography>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
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
                        {taxReport.map((row, index) => (
                            <TableRow
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {row.symbol}
                            </TableCell>
                            <TableCell align="right">{format(row.purchaseDate, 'yyyy-MM-dd')}</TableCell>
                            <TableCell align="right">{format(row.saleDate, 'yyyy-MM-dd')}</TableCell>
                            <TableCell align="right">{row.purchasePriceEUR.toFixed(3)}</TableCell>
                            <TableCell align="right">{row.salePriceEUR.toFixed(3)}</TableCell>
                            <TableCell align="right">{row.saleFeesEUR.toFixed(3)}</TableCell>
                            <TableCell align="right">{row.quantity}</TableCell>
                            <TableCell align="right">{row.capitalLossEUR.toFixed(2)}</TableCell>
                            <TableCell align="right">{row.capitalGainEUR.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </CardContent>
        </Card>
    )
}