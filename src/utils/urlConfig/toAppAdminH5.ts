//获取线上url
export const getUrlIP_PORT = () => {
  const { protocol, hostname, port } = window.location;
  const defaultPorts = { 'http:': 80, 'https:': 443 };
  const shouldIncludePort = port ? port : defaultPorts[protocol];
  return `${protocol}//${hostname}${shouldIncludePort ? ':' + port : ''}`;
};
