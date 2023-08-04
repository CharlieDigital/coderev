import dayjs from 'dayjs';
import { FirebaseStorage, uploadBytes, ref, getDownloadURL, deleteObject, getBlob } from "firebase/storage";

/**
 * Models the result of a file upload
 */
export type UploadResult = {
  uid: string,
  size: number,
  url: string,
  path: string,
  addedAtUtc: string,
}

/**
 * Storage wrapper.
 */
export abstract class Storage {
  /**
   * Base constructor
   */
  constructor() {}

  /**
   * Inheriting classes override this class to provide the storage root.
   */
  protected abstract get storage(): FirebaseStorage;

  /**
   * Adds a source file to the backing store.  Unless an explicit ID is supplied,
   * a hash of the file contents is calculated and assigned as the reference ID.
   * This way, if the same file is added twice, only one copy is stored since the
   * path will already exist based on the hash of the contents.
   * @param path The path part for the image.
   * @param originalFileName The original file name.
   * @param file The blob that contains the contents of the media.
   * @param size The size of the image for compression.
   * @param additionalMetadata Additional metadata to apply to the file.
   * @param explicitUid When supplied, the explicit UID to use for the file.
   * @returns A Media object which needs to be persisted.  The ID of which is the SHA-1 hash of the contents.
   */
  protected async addFile(
    path: string,
    originalFileName: string,
    file: File,
    additionalMetadata?: Record<string, string>,
    explicitUid?: string
  ) : Promise<UploadResult> {
    // The extension includes the .
    let extension = originalFileName
      .substring(originalFileName.lastIndexOf('.'))
      .toLowerCase()

    let uid = explicitUid

    if (!uid) {
      // Calculate the hash of the file to use as an ID and path if no ID is supplied.
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-1', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toLowerCase()

      uid = hashHex
    } else {
      if (!additionalMetadata) {
        additionalMetadata = {}
      }

      // Track that we've assigned an explicit UID.
      additionalMetadata["explicitUid"] = uid
    }

    // Store the file.
    const fileRef = ref(this.storage, `${path}/${uid}${extension}`)
    const result = await uploadBytes(fileRef, file, {
      // This sets the caching policy on the image in storage.
      cacheControl: 'public, max-age=3600, s-maxage=3600',
      customMetadata: {
        originalFileName,
        ...additionalMetadata,
      },
    })

    const downloadUrl = await getDownloadURL(fileRef)

    return {
      uid: uid,
      size: result.metadata.size,
      url: downloadUrl,
      path: result.ref.fullPath,
      addedAtUtc: dayjs().utc().toISOString(),
    }
  }

  /**
   * Deletes a file from the backing storage.
   * @param path The path to the file to delete.
   */
  public async deleteFile(path: string) : Promise<boolean> {
    const targetRef = ref(this.storage, path)

    try {
      console.log(`🗑️ Deleting files at path: ${targetRef.fullPath}`)
      await deleteObject(targetRef)
      return true
    } catch (e) {
      console.error(`Deletion of file: ${path} failed.`)
      console.error(e)
      return false
    }
  }

  /**
   * Reads the text contents of a given file in the storage target.
   * @param path The path to the file in this storage target.
   * @returns The string contents of the file.
   */
  public async readText(path: string) {
    const targetRef = ref(this.storage, path)

    try {
      const blob = await getBlob(targetRef)
      const text = await blob.text()
      return text
    } catch (e) {
      console.error(`Read of file: ${path} failed.`)
      console.error(e)
      return ""
    }
  }
}

/**
 * This is the storage connector for the source files.
 */
export class SourceStorage extends Storage {
  /**
   * Points to the storage bucket for the source files.
   */
  protected get storage(): FirebaseStorage {
    return firebaseConnector.sourceStorage;
  }

  /**
   * Adds a set of files to the workspace.  Supply an explicit UID to overwrite an
   * existing file with a different set of contents.
   * @param workspaceUid The UID of the workspace to add the files for.
   * @param files The file to add to the workspace folder.
   * @param metadata The set of metadata to assign to the file.
   * @param explicitUid When supplied, the explicit UID to use for the file.
   */
  public async addSourceFile(
    workspaceUid: string,
    file: File,
    metadata?: Record<string, string>,
    explicitUid?: string
  ) : Promise<UploadResult> {
    return await super.addFile(
      workspaceUid,
      file.name,
      file,
      metadata,
      explicitUid
    )
  }
}

export const sourceStorage = new SourceStorage();
