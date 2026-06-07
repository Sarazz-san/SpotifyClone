// @ts-ignore
import jsmediatags from 'jsmediatags/dist/jsmediatags.min.js';

export const extractMetadata = async (fileUri: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // We can try to fetch the file to get a Blob, but jsmediatags also accepts a URL string in browser environments.
    // In React Native, passing a file:// URI to jsmediatags might work if it uses fetch internally.
    // However, if not, we fetch it manually.
    fetch(fileUri)
      .then(res => res.blob())
      .then(blob => {
        jsmediatags.read(blob as any, {
          onSuccess: (tag) => {
            const tags = tag.tags;
            console.log('Metadata tags extracted from file:', {
              title: tags.title,
              artist: tags.artist,
              album: tags.album,
              genre: tags.genre
            });
            
            let coverBase64 = null;
            
            if (tags.picture) {
              try {
                const { data, format } = tags.picture;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                  base64String += String.fromCharCode(data[i]);
                }
                const btoa = (str: string) => {
                  try {
                    return global.btoa ? global.btoa(str) : require('buffer').Buffer.from(str, 'binary').toString('base64');
                  } catch (e) {
                    return '';
                  }
                };
                coverBase64 = `data:${format};base64,${btoa(base64String)}`;
              } catch (e) {
                console.log('Error parsing picture', e);
              }
            }

            resolve({
              title: tags.title || '',
              artist: tags.artist || '',
              album: tags.album || '',
              genre: tags.genre || '',
              coverUri: coverBase64
            });
          },
          onError: (error) => {
            reject(error);
          }
        });
      })
      .catch(err => reject(err));
  });
};
