import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { isNumber } from 'lodash';

export type InsightCardProps = {
    title: string,
    valueEUR?: number,
    valueUSD?: number,
    valueStr?: string
}

const formatEUR = (value: number) => {
    const formatter = new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' });
    return formatter.format(value);
}

const formatUSD = (value: number) => {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    return formatter.format(value);
}

export const InsightCard: React.FC<InsightCardProps> = ({
    title,
    valueEUR,
    valueUSD,
    valueStr
}) => {
    let cardContent;
    if (isNumber(valueEUR)) {
        cardContent = formatEUR(valueEUR);
    } else if (isNumber(valueUSD)) {
        cardContent = formatUSD(valueUSD);
    } else {
        cardContent = valueStr; 
    }

    return <Card sx={{ }}>
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        {cardContent}
      </Typography>
    </CardContent>
  </Card>
}