import { render, fireEvent } from '@testing-library/vue';
import Jsx from './jsx.vue';

test('renders jsx', async () => {
  // The render method returns a collection of utilities to query your component.
  const msg = 'Hello, demo';
  const { getByText } = render(Jsx);

  // getByText returns the first matching node for the provided text, and
  // throws an error if no elements match or if more than one match is found.
  getByText(msg);

  // const button = getByText('increment')

  // Dispatch a native click event to our button element.
  // await fireEvent.click(button)
  // await fireEvent.click(button)

  // getByText('Times clicked: 2')
});
