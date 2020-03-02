import { addParameters, addDecorator } from "@storybook/react";
import { withKnobs } from "@storybook/addon-knobs";
import { checkA11y } from "@storybook/addon-a11y";

addParameters({
  options: {
    name: "useBinding"
  }
});

addDecorator(withKnobs);
addDecorator(checkA11y);
