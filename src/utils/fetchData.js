import axios from 'axios'

const AIRTABLE_ENDPOINT = `https://api.airtable.com/v0/appYhOJzZ23t4Y7Vc/WolneDesery`
const DELETE_RECORD_ENDPOINT = `https://api.airtable.com/v0/appYhOJzZ23t4Y7Vc/WolneDesery`
const WIKIPEDIA_ENDPOINT = `https://en.wikipedia.org/w/api.php`


export const fetchtTableLength = async () => {
  let tabLength = ''
  let randomNumber = ''
  await axios.get(AIRTABLE_ENDPOINT,
    {
      params:
      {
        view: 'Grid view',
        api_key: 'keyyMzVS2EzPKsaLV',
        maxRecords: 1,
      }
    })
    .then(({ data }) => {
      tabLength = data.records[0].fields.Numer
      randomNumber = Math.floor(Math.random() * (tabLength - 1 + 1)) + 2
    })
  console.log(`table length: ${tabLength}`)
  console.log(`random number ${randomNumber}`)
  return randomNumber
}


export const fetchDessertImage = async (name) => {
  const { data } = await axios.get(WIKIPEDIA_ENDPOINT,
    {
      params:
      {
        action: 'query',
        prop: 'pageimages',
        piprop: 'original',
        format: 'json',
        titles: name,
        origin: '*',
      }
    });
  return data
}

export const fetchDessert = async (randomNumber) => {
  let dessert = {
    number: null,
    name: '',
    recordId: ''
  }
  await axios.get(AIRTABLE_ENDPOINT,
    {
      params:
      {
        api_key: 'keyyMzVS2EzPKsaLV',
        view: 'Grid view',
        filterByFormula: `{NUMER} = "${randomNumber}"`
      }
    })
    .then(({ data }) => {
      console.log(data)
      if (data.records.length) {
        dessert = {
          ...dessert,
          number: randomNumber,
          name: data.records[0].fields.Deser,
          recordId: data.records[0].id,
        }


        return axios.get(WIKIPEDIA_ENDPOINT,
          {
            params:
            {
              action: 'query',
              list: 'search',
              prop: 'info',
              format: 'json',
              inprop: 'url',
              srlimit: 1,
              srsearch: dessert.name,
              origin: '*',
            },
          })
          .then(({ data }) => {
            const { query } = data
            console.log(data);
            console.log(query.hasOwnProperty('search'))
            dessert = {
              ...dessert,
              meta: data.query.search[0].snippet,
            }
          }).catch((error) => {
            console.log(error);
          })
          .then(() => {
            return axios.get(WIKIPEDIA_ENDPOINT,
              {
                params:
                {
                  action: 'query',
                  prop: 'pageimages',
                  piprop: 'original',
                  format: 'json',
                  titles: dessert.name,
                  origin: '*',
                }
              });
          })
          .then(({ data }) => {
            const result = data.query.pages;
            const id = Object.keys(result)[0];
            console.log(result[id].hasOwnProperty('original'))
            dessert = {
              ...dessert,
              img: result[id].hasOwnProperty('original') ? result[id].original.source : 'https://i.imgur.com/uCqQoR2.jpg',
            }
          })
          .then(() => {
            return axios.delete(`${DELETE_RECORD_ENDPOINT}/${dessert.recordId}`,
              {
                headers:
                {
                  'Authorization': 'Bearer keyyMzVS2EzPKsaLV'
                }
              })
          })
      } else {
        dessert = {
          ...dessert,
          name: 'Niestety deser o tym numerze jest już zajęty!',
          number: randomNumber,
          meta: 'taken',
        }
      }
    })
  return dessert;
}

