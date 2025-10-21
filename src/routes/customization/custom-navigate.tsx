import { Navigate, NavigateProps, useParams } from "react-router-dom";

export function CustomNavigate({ to, ...props }: NavigateProps) {
  const { customParam } = useParams();
  const newLocation = to[0] === "/" ? `/${customParam}${to}` : to;

  return <Navigate to={newLocation} {...props} />;
}
