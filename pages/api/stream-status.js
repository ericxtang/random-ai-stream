export default async function handler(req, res) {
  const streamLinks = [
    {"musicLink": 'https://livepeercdn.studio/hls/bebf17pum9hv4bew/index.m3u8', "musicStreamID": "bebf3899-c7ee-432b-a8ca-b55520e8e48c", "name": "Christmas", "sourceStreamID": "b408d651-46fa-4f5d-ae6f-db31066ad6e8", "sourceLink": "https://livepeercdn.studio/hls/b4082jfpgrwe9eu7/index.m3u8"},
    {"musicLink": 'https://livepeercdn.studio/hls/56f4q4gjwc9t7jsw/index.m3u8', "musicStreamID": "56f4940c-ca98-4b19-b9f4-3e0e885c91e1", "name": "Ghibli", "sourceStreamID": "8b266589-a780-4d0a-83fe-59f32fa580e9", "sourceLink": "https://livepeercdn.studio/hls/8b265heg5duil4xp/index.m3u8"},
    {"musicLink": 'https://livepeercdn.studio/hls/a4103h5y10a9t9xi/index.m3u8', "musicStreamID": "a4101225-a9e8-4dbe-a2e7-8e249357b637", "name": "Ballet", "sourceStreamID": "9e54edfa-2b5b-4bb3-b168-c2dbf5efaa18", "sourceLink": "https://livepeercdn.studio/hls/9e54wftw3s8u77ri/index.m3u8"},
    {"musicLink": 'https://livepeercdn.studio/hls/aecbfhd5g8gry4if/index.m3u8', "musicStreamID": "aecb9249-1789-4ae3-894f-b51ca9e42e18", "name": "Jellyfish", "sourceStreamID": "c2575818-f315-43cf-acd3-084dbee29984", "sourceLink": "https://livepeercdn.studio/hls/c257wnwwvckystf2/index.m3u8"},
    {"musicLink": 'https://livepeercdn.studio/hls/feb8pjd3amp90iej/index.m3u8', "musicStreamID": "feb8e718-635f-45c0-837f-8e28e3576c5f", "name": "Nightsky", "sourceStreamID": "4b868d32-7f33-4f3f-a251-a858a3752f57", "sourceLink": "https://livepeercdn.studio/hls/4b86ick5znlbpinj/index.m3u8"},
    {"musicLink": 'https://livepeercdn.studio/hls/f1c6i42ondt3jkbi/index.m3u8', "musicStreamID": "f1c6d706-03de-43f5-9da6-87f326b997af", "name": "New Years", "sourceStreamID": "b92250ed-9355-4f5d-b4d1-d5c29ab6af48", "sourceLink": "https://livepeercdn.studio/hls/b9222618fmombewp/index.m3u8"},
  ];

  const options = {
    method: 'GET',
    headers: { Authorization: 'Bearer 4425c9d9-15e4-48d2-900b-3a17d4fa4e21' },
  };

  for (const stream of streamLinks) {
    try {
      const response = await fetch(`https://livepeer.studio/api/stream/${stream.musicStreamID}`, options);
      const data = await response.json();
      console.log(data);
      stream["musicStreamStatus"] = data.isActive ? 'Online' : 'Offline';
    } catch (error) {
      console.error(`Error fetching status for ${stream.id}:`, error);
      stream["musicStraemStatus"] = 'Offline';
    }

    try {
      const response = await fetch(`https://livepeer.studio/api/stream/${stream.sourceStreamID}`, options);
      const data = await response.json();
      console.log(data);
      stream["sourceStreamStatus"] = data.isActive ? 'Online' : 'Offline';
    } catch (error) {
      console.error(`Error fetching source status for ${stream.name}:`, error);
      stream["sourceStreamStatus"] = 'Offline';
    }
  }

  res.status(200).json(streamLinks);
}
