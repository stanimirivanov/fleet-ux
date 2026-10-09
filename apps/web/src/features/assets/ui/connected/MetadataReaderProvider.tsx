import { createContext, type JSX, useContext } from 'solid-js';
import type { MetadataReader } from '../../model/metadata';

interface MetadataReaderContext {
  readonly reader?: MetadataReader;
  readonly onUnauthorized?: () => void;
}
const Context = createContext<MetadataReaderContext>({});

/** Composition supplies the transport port; feature views never own credentials. */
export function MetadataReaderProvider(
  props: MetadataReaderContext & { readonly children: JSX.Element },
) {
  return <Context.Provider value={props}>{props.children}</Context.Provider>;
}

export function useMetadataReader(): MetadataReaderContext {
  return useContext(Context);
}
