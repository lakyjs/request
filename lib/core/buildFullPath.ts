import { combineURL, isAbsoluteURL } from '@/helpers/url';

export default function buildFullPath(baseURL: string | undefined, requestedURL: string) {
  return (baseURL && !isAbsoluteURL(requestedURL)) ? combineURL(baseURL, requestedURL) : requestedURL;
}
