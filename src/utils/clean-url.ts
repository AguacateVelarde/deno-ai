export const removeDomainFromUrl = (host: string, url: string) => {
  return url
    .replace(`http://${host}`, "")
    .replace(`https://${host}`, "")
    .split("?")[0];
};
