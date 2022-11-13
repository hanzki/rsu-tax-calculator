import { ComponentStory, ComponentMeta } from '@storybook/react';

import { FileUpload } from '../FileUpload/FileUpload';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Controls/FileUpload',
  component: FileUpload,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    onChange: { action: 'File Changed'}
  },
} as ComponentMeta<typeof FileUpload>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof FileUpload> = (args) => <FileUpload {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  accept: 'text/csv',
  label: 'Individual History'
};

export const Success = Template.bind({});
Success.args = {
  accept: 'text/csv',
  label: 'Individual History',
  success: true
};

export const Failure = Template.bind({});
Failure.args = {
  accept: 'text/csv',
  label: 'Individual History',
  error: true
};


