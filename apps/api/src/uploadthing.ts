import { createUploadthing, type FileRouter } from 'uploadthing/server';

const f = createUploadthing();

export const uploadRouter = {
  fileUploader: f({
    text: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(data => {
    console.log('upload completed', data);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
