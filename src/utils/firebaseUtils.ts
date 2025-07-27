import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Timestamp } from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import { Event, User, Team } from '../types';

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Check if a user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return auth().currentUser !== null;
};

/**
 * Sign out the current user
 * @returns A promise that resolves when the user is signed out
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get a Firestore document by ID
 * @param collection - The collection name
 * @param id - The document ID
 * @returns A promise that resolves to the document data or null if not found
 */
export const getDocument = async <T>(
  collection: string,
  id: string
): Promise<T | null> => {
  try {
    const doc = await firestore().collection(collection).doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data(),
    } as T;
  } catch (error) {
    console.error(`Error getting ${collection} document:`, error);
    throw error;
  }
};

/**
 * Get all documents from a Firestore collection
 * @param collection - The collection name
 * @param query - Optional query constraints
 * @returns A promise that resolves to an array of documents
 */
export const getDocuments = async <T>(
  collection: string,
  query: (ref: FirebaseFirestoreTypes.Query) => FirebaseFirestoreTypes.Query = ref => ref
): Promise<T[]> => {
  try {
    let ref = firestore().collection(collection) as FirebaseFirestoreTypes.Query;
    ref = query(ref);
    
    const snapshot = await ref.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error(`Error getting ${collection} documents:`, error);
    throw error;
  }
};

/**
 * Add a document to a Firestore collection
 * @param collection - The collection name
 * @param data - The document data
 * @returns A promise that resolves to the document ID
 */
export const addDocument = async <T extends Record<string, any>>(
  collection: string,
  data: T
): Promise<string> => {
  try {
    const docRef = await firestore().collection(collection).add({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error(`Error adding ${collection} document:`, error);
    throw error;
  }
};

/**
 * Update a Firestore document
 * @param collection - The collection name
 * @param id - The document ID
 * @param data - The document data to update
 * @returns A promise that resolves when the update is complete
 */
export const updateDocument = async <T extends Record<string, any>>(
  collection: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  try {
    await firestore().collection(collection).doc(id).update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating ${collection} document:`, error);
    throw error;
  }
};

/**
 * Delete a Firestore document
 * @param collection - The collection name
 * @param id - The document ID
 * @returns A promise that resolves when the delete is complete
 */
export const deleteDocument = async (
  collection: string,
  id: string
): Promise<void> => {
  try {
    await firestore().collection(collection).doc(id).delete();
  } catch (error) {
    console.error(`Error deleting ${collection} document:`, error);
    throw error;
  }
};

/**
 * Upload a file to Firebase Storage
 * @param path - The storage path (e.g., 'profile-pictures', 'event-images')
 * @param file - The file to upload (either a React Native file object or a Blob)
 * @param metadata - Optional metadata for the file
 * @returns A promise that resolves to the download URL
 */
export const uploadFile = async (
  path: string,
  file: any,
  metadata: any = {}
): Promise<string> => {
  try {
    // Generate a unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileExtension = file.name ? file.name.split('.').pop() : 'jpg';
    const storagePath = `${path}/${filename}.${fileExtension}`;
    
    // Create a reference to the file
    const storageRef = storage().ref(storagePath);
    
    // Upload the file
    let uploadTask;
    
    if (Platform.OS === 'web') {
      // For web, we might have a File or Blob
      uploadTask = storageRef.put(file);
    } else {
      // For React Native, we have a file URI
      const task = storageRef.putFile(file.uri || file.path);
      
      // Wait for the upload to complete
      await task;
    }
    
    // Get the download URL
    const downloadURL = await storageRef.getDownloadURL();
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param url - The download URL of the file to delete
 * @returns A promise that resolves when the file is deleted
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extract the path from the download URL
    const matches = url.match(/o\/(.*?)\?/);
    if (!matches || matches.length < 2) {
      throw new Error('Invalid storage URL');
    }
    
    const filePath = decodeURIComponent(matches[1]);
    const fileRef = storage().ref(filePath);
    
    await fileRef.delete();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Subscribe to a Firestore document
 * @param collection - The collection name
 * @param id - The document ID
 * @param callback - The callback function to call when the document changes
 * @returns An unsubscribe function
 */
export const subscribeToDocument = <T>(
  collection: string,
  id: string,
  callback: (data: T | null) => void
): (() => void) => {
  return firestore()
    .collection(collection)
    .doc(id)
    .onSnapshot(
      (snapshot) => {
        if (snapshot.exists) {
          callback({
            id: snapshot.id,
            ...snapshot.data(),
          } as T);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Error subscribing to ${collection} document:`, error);
      }
    );
};

/**
 * Subscribe to a Firestore collection
 * @param collection - The collection name
 * @param query - Optional query constraints
 * @param callback - The callback function to call when the collection changes
 * @returns An unsubscribe function
 */
export const subscribeToCollection = <T>(
  collection: string,
  query: (ref: FirebaseFirestoreTypes.Query) => FirebaseFirestoreTypes.Query = ref => ref,
  callback: (data: T[]) => void
): (() => void) => {
  let ref = firestore().collection(collection) as FirebaseFirestoreTypes.Query;
  ref = query(ref);
  
  return ref.onSnapshot(
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      
      callback(data);
    },
    (error) => {
      console.error(`Error subscribing to ${collection} collection:`, error);
    }
  );
};

/**
 * Convert a Firestore timestamp to a JavaScript Date
 * @param timestamp - The Firestore timestamp
 * @returns A JavaScript Date object
 */
export const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  return null;
};

/**
 * Convert a JavaScript Date to a Firestore timestamp
 * @param date - The JavaScript Date
 * @returns A Firestore timestamp
 */
export const toTimestamp = (date: Date | string | number | null): any => {
  if (!date) return firestore.FieldValue.serverTimestamp();
  
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  
  if (typeof date === 'string' || typeof date === 'number') {
    return Timestamp.fromDate(new Date(date));
  }
  
  return firestore.FieldValue.serverTimestamp();
};

/**
 * Batch update multiple documents
 * @param updates - Array of update operations
 * @returns A promise that resolves when the batch is committed
 */
export const batchUpdate = async (
  updates: Array<{
    collection: string;
    id: string;
    data: Record<string, any>;
  }>
): Promise<void> => {
  const batch = firestore().batch();
  
  updates.forEach(({ collection, id, data }) => {
    const ref = firestore().collection(collection).doc(id);
    batch.update(ref, {
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  });
  
  await batch.commit();
};

/**
 * Run a Firestore transaction
 * @param updateFunction - The update function to run in the transaction
 * @returns A promise that resolves with the result of the update function
 */
export const runTransaction = async <T>(
  updateFunction: (transaction: FirebaseFirestoreTypes.Transaction) => Promise<T>
): Promise<T> => {
  return await firestore().runTransaction(updateFunction);
};

/**
 * Create a Firestore query with pagination
 * @param collection - The collection name
 * @param options - Pagination options
 * @returns An object with the query and methods for pagination
 */
export const createPaginatedQuery = (
  collection: string,
  options: {
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    where?: Array<[string, FirebaseFirestoreTypes.WhereFilterOp, any]>;
  } = {}
) => {
  const {
    limit = 10,
    orderBy = 'createdAt',
    orderDirection = 'desc',
    where = [],
  } = options;
  
  let query = firestore()
    .collection(collection)
    .orderBy(orderBy, orderDirection)
    .limit(limit) as FirebaseFirestoreTypes.Query;
  
  // Apply where conditions
  where.forEach(([field, operator, value]) => {
    query = query.where(field, operator, value);
  });
  
  return {
    query,
    getNextPage: async (lastVisible: any) => {
      let nextQuery = firestore()
        .collection(collection)
        .orderBy(orderBy, orderDirection)
        .startAfter(lastVisible)
        .limit(limit) as FirebaseFirestoreTypes.Query;
      
      // Apply where conditions
      where.forEach(([field, operator, value]) => {
        nextQuery = nextQuery.where(field, operator, value);
      });
      
      const snapshot = await nextQuery.get();
      return snapshot.docs;
    },
  };
};

// Export Firestore and auth instances for direct use
export { firestore, auth, storage };
