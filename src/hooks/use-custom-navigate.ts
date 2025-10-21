import { NavigateFunction, NavigateOptions, To, useNavigate, useParams } from 'react-router-dom';

export function useCustomNavigate(): NavigateFunction {
  const domNavigate = useNavigate();

  const { customParam } = useParams();

  function navigate(to: To | number, options?: NavigateOptions) {
    if (typeof to === 'number') {
      domNavigate(to);
    } else {
      domNavigate(!to[0] === '/' ? `/${customParam}${to}` : to, options);
    }
  }

  return navigate;
}
