import { ComponentStory, ComponentMeta } from '@storybook/react';

import { InputPanel } from '../InputPanel/InputPanel';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Views/InputPanel',
  component: InputPanel,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    onCalculate: { action: 'Calculate called'}
  },
} as ComponentMeta<typeof InputPanel>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof InputPanel> = (args) => <InputPanel {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
};
