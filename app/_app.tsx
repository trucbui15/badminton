import { unstableSetRender } from 'antd';
import { createRoot, Root } from 'react-dom/client';

// Tạo interface mở rộng
interface CustomContainer extends Element {
  _reactRoot?: Root;
}

unstableSetRender((node, container) => {
  const customContainer = container as CustomContainer;
  customContainer._reactRoot ||= createRoot(customContainer);
  const root = customContainer._reactRoot!;
  root.render(node);
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});
