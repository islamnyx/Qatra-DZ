/**
 * Single entry for all app data — switches REST vs Firebase via .env.local
 *
 *   VITE_DATA_PROVIDER=rest      → Node backend (default)
 *   VITE_DATA_PROVIDER=firebase  → Firebase adapters (with REST fallback)
 */
import { isFirebaseEnabled } from "../../config/env.js";
import * as restProvider from "./restProvider.js";
import * as firebaseProvider from "../../features/firebase/provider.js";

export const data = isFirebaseEnabled() ? firebaseProvider : restProvider;
