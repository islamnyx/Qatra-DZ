import { isFirebaseConfigured } from "../services/firebase/init.js";
import { hospitalDbApi } from "./hospitalDbApi.js";
import { firebaseHospitalApi } from "./firebaseHospitalApi.js";

const useFirebase =
  import.meta.env.VITE_DATA_PROVIDER === "firebase" && isFirebaseConfigured();

/** Unified hospital database + panel API */
export const api = useFirebase ? firebaseHospitalApi : hospitalDbApi;

export { isFirebaseConfigured };
