import { Box, Typography } from "@mui/material"
import React from "react"
import { last, uniq } from "lodash";
import { TaxSaleOfSecurity } from "../calculator";
import { PeriodSelector } from "./PeriodSelector";
import { SaleOfSecuritiesTable } from "./SaleOfSecuritiesTable";

export type ResultsPanelProps = {
    taxReport: TaxSaleOfSecurity[]
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
    taxReport
}) => {
    const periods = uniq(taxReport.map(t => t.saleDate.getFullYear().toString())).sort();
    if (periods.length < 1) {
        throw new Error('No data to show'); // TODO: Handle empty case better
    }

    const [period, setPeriod] = React.useState(last(periods) as string);

    const salesWithinPeriod = taxReport.filter(t => t.saleDate.getFullYear().toString() === period);
    console.log(salesWithinPeriod);

    return <Box sx={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Typography textAlign={'center'} variant={'h4'} gutterBottom>Results</Typography>
        <PeriodSelector options={periods} selection={period} setSelection={setPeriod}/>
        <SaleOfSecuritiesTable transactions={salesWithinPeriod}/>
    </Box>
};