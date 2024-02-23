import {
  useApi,
  reactExtension,
  Heading,
  BlockSpacer,
  Divider,
  useSettings,
} from '@shopify/ui-extensions-react/checkout';

import { useEffect, useState } from 'react';

import UpsellItem from './UpsellItem';

export default reactExtension(
  'purchase.checkout.cart-line-list.render-after',
  () => <Extension />,
);

interface CollectionData {
  title: string,
  id: string;
  products: {
    edges: Array<any>
  };
}

function Extension() {

  const { query } = useApi();

  const [collectionData, setCollectionData] = useState<null | CollectionData>(null);

  const settings = useSettings();
  const upsellTitle = settings.upsell_title as string;
  const ifMultiple = settings.multiple_products as boolean;
  const collectionId = settings.selected_collection as string;
  const variantId = settings.selected_variant as string;

  useEffect(() => {
    async function getCollectionData() {
      const queryResult = await query<{collection: CollectionData}>(`{
        collection(id: "${collectionId}") {
          title
          id
          products(first: 25) {
            edges {
              node {
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }`)

      if (queryResult.data) {
        setCollectionData(queryResult.data.collection);
      }
    }

    getCollectionData()
}, [])

  if (ifMultiple && !collectionData) return null

  if (!ifMultiple && !variantId) return null

  return (
    <>
      <Divider/>
      <BlockSpacer spacing="base"/>
      <Heading level={2}>{upsellTitle}</Heading>
      { ifMultiple && 
        <>
          {
            collectionData.products.edges.map(function(product, i){
              return (<UpsellItem key={"upsell-item-"+i} variantId = {product.node.variants.edges[0].node.id}></UpsellItem>)
            })
          }
        </>
      }
      { !ifMultiple && <UpsellItem variantId = {variantId}></UpsellItem> }  
    </>
  );
}