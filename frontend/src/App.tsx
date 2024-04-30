import React, { useState } from "react";
import "./App.css";
import { uploadFile } from "./services/upload";
import { Toaster, toast } from "sonner";
import { type Data } from "./types";
import ErrorBoundary from "./components/ErrorBounday";
import { Search } from "./steps/Search";

const APP_STATUS = {
  IDLE: "idle", //start
  ERROR: "error", //erro
  READY_UPLOAD: "ready_upload", //ready to upload
  UPLOADING: "uploading",
  READY_USAGE: "ready_usage",
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: "Upload",
  [APP_STATUS.UPLOADING]: "Uploading...",
} as const;

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Data | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (file) {
      setFile(file);
      setAppStatus(APP_STATUS.READY_UPLOAD);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) return;

    setAppStatus(APP_STATUS.UPLOADING);

    const [err, resData] = await uploadFile(file);

    if (err) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(err.message);
      return;
    }
    setAppStatus(APP_STATUS.READY_USAGE);
    if (resData) {
      setData(resData);
      toast.success("File uploaded successfully");
    }
  };

  const showButton =
    appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;

  const showInput =
    appStatus === APP_STATUS.IDLE || appStatus === APP_STATUS.READY_UPLOAD;
  return (
    <>
      <ErrorBoundary>
        <Toaster richColors/>
        <h4>Upload CSV and Search</h4>
        {showInput && 
           <form onSubmit={handleSubmit}>
           <label>
             <input
               disabled={appStatus === APP_STATUS.UPLOADING as AppStatusType}
               onChange={handleFileChange}
               name="file"
               type="file"
               accept=".csv"
             />
           </label>
           {showButton && (
             <button
               type="submit"
               disabled={appStatus === APP_STATUS.UPLOADING as AppStatusType}
             >
               {BUTTON_TEXT[appStatus]}
             </button>
           )}
         </form>
        }
        {
          appStatus === APP_STATUS.READY_USAGE && 
          <Search initialData={data!}/>
        }
      </ErrorBoundary>
    </>
  );
}

export default App;
