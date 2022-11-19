import { ComponentStory, ComponentMeta } from '@storybook/react';
import { compareAsc } from 'date-fns';
import { random } from 'lodash';
import { TaxSaleOfSecurity } from '../calculator';

import { ResultsPanel } from '../ResultsPanel/ResultsPanel';

const RAND_DATE_MIN = new Date(2018, 1, 1).getTime();
const RAND_DATE_MAX = new Date().getTime();

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Views/ResultsPanel',
  component: ResultsPanel,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
} as ComponentMeta<typeof ResultsPanel>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ResultsPanel> = (args) => <ResultsPanel {...args} />;

const saleOfSecurity = (data: Partial<TaxSaleOfSecurity> = {}): TaxSaleOfSecurity => {
  const quantity = data.quantity || random(0, 100);
  const saleDate = data.saleDate || new Date(random(RAND_DATE_MIN, RAND_DATE_MAX));
  const purchaseDate = data.purchaseDate || new Date(random(RAND_DATE_MIN, saleDate.getTime()));
  const salePriceEUR = data.salePriceEUR || random(0, 200, true);
  const saleFeesEUR = data.saleFeesEUR || random(0, 1, true);
  const purchasePriceEUR = data.purchasePriceEUR || random(0, 200, true);
  const gainloss = (salePriceEUR - purchasePriceEUR) * quantity - saleFeesEUR;
  const capitalGainEUR = data.capitalGainEUR || (gainloss > 0 ? gainloss : 0);
  const capitalLossEUR = data.capitalLossEUR || (gainloss < 0 ? -gainloss : 0);
  return { 
    symbol: data.symbol || 'V',
    quantity: quantity,
    saleDate: saleDate,
    purchaseDate: purchaseDate,
    salePriceEUR: salePriceEUR,
    saleFeesEUR: saleFeesEUR,
    purchasePriceEUR: purchasePriceEUR,
    purchaseFeesEUR: 0,
    deemedAcquisitionCostEUR: 0,
    capitalGainEUR: capitalGainEUR,
    capitalLossEUR: capitalLossEUR
  }
}

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  taxReport: [
    saleOfSecurity(),
    saleOfSecurity(),
    saleOfSecurity(),
    saleOfSecurity(),
    saleOfSecurity(),
    saleOfSecurity(),
    saleOfSecurity(),
    saleOfSecurity(),
  ].sort((a,b) => compareAsc(a.saleDate, b.saleDate))
};
