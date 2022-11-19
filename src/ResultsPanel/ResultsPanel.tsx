import { Box, Typography } from "@mui/material"
import React from "react"
import { last, sumBy, uniq } from "lodash";
import { TaxSaleOfSecurity } from "../calculator";
import { PeriodSelector } from "./PeriodSelector";
import { SaleOfSecuritiesTable } from "./SaleOfSecuritiesTable";
import { InsightCard } from "./InsightCard";

export type ResultsPanelProps = {
    taxReport: TaxSaleOfSecurity[]
}

const Spacer = () => <Box sx={{m: 1}}/>;

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
    taxReport
}) => {
    const periods = uniq(taxReport.map(t => t.saleDate.getFullYear().toString())).sort();
    if (periods.length < 1) {
        throw new Error('No data to show'); // TODO: Handle empty case better
    }

    const [period, setPeriod] = React.useState(last(periods) as string);

    const salesWithinPeriod = taxReport.filter(t => t.saleDate.getFullYear().toString() === period);
    const sharesSold = sumBy(salesWithinPeriod, t => t.quantity)
    const capitalGain = sumBy(salesWithinPeriod, t => t.capitalGainEUR);
    const capitalLoss = sumBy(salesWithinPeriod, t => t.capitalLossEUR);

    return <Box sx={{
        padding: '10px',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <Typography textAlign={'center'} variant={'h4'} gutterBottom>Results</Typography>
        <PeriodSelector options={periods} selection={period} setSelection={setPeriod}/>

        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2
        }}>
            <InsightCard title="Shares Sold" valueStr={sharesSold.toString()}/>
            <Spacer/>
            <InsightCard title="Capital Gain" valueEUR={capitalGain}/>
            <Spacer/>
            <InsightCard title="Capital Loss" valueEUR={capitalLoss}/>
        </Box>
        <SaleOfSecuritiesTable transactions={salesWithinPeriod}/>
    </Box>
};