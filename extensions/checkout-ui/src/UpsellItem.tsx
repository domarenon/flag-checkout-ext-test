import {
    useApi,
    Checkbox, 
    InlineLayout,
    Image,
    BlockStack,
    Text,
    Pressable,
    BlockSpacer,
    useCartLines,
    useApplyCartLinesChange
  } from '@shopify/ui-extensions-react/checkout';
  
  import { useEffect, useRef, useState } from 'react';
  
  interface VariantData {
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    }
    product: {
      title: string;
      featuredImage?: {
        url: string;
        altText: string;
      }
    }
    image?: {
      url: string;
      altText: string;
    }
  }
  
  export default function UpsellItem({ variantId }) {

    const { query } = useApi();
  
    const [variantData, setVariantData] = useState<null | VariantData>(null);
    const [isSelected, setIsSelected] = useState(false);

    const hasPageBeenRendered = useRef(false);
  
    const cartLines = useCartLines();
    const applyCartLinesChange = useApplyCartLinesChange(); 
  
    useEffect(() => {
      if (hasPageBeenRendered.current) {
        if(isSelected) {
          applyCartLinesChange({
            type: "addCartLine",
            quantity: 1,
            merchandiseId: variantId
          })
        } else {
          const cartLineId = cartLines.find((cartLine) => cartLine.merchandise.id === variantId)?.id;
    
          if(cartLineId) {
            applyCartLinesChange({
              type: "removeCartLine",
              id: cartLineId,
              quantity: 1
            })
          }
        }
      }
      hasPageBeenRendered.current = true
    }, [isSelected])

    useEffect(() => {
      async function getVariantData() {
        const queryResult = await query<{node: VariantData}>(`{
          node(id: "${variantId}") {
            ... on ProductVariant {
              title
              price {
                amount
                currencyCode
              }
              product {
                title
                featuredImage {
                  url
                  altText
                }
              }
              image {
                url
                altText
              }
            }
          }
        }`)
  
        if (queryResult.data) {
          setVariantData(queryResult.data.node);
        }
      }

      const cartLineId = cartLines.find((cartLine) => cartLine.merchandise.id === variantId)?.id;

      if(!cartLineId) {
        getVariantData()
      }
    
    }, [])
  
    if (!variantData) return null
  
    return (
      <>
        <BlockSpacer spacing="base"/>
        <Pressable onPress={() => setIsSelected(!isSelected)}>
          <InlineLayout
            blockAlignment="center"
            spacing={["base","base"]}
            columns={["auto",70,"fill"]}
            padding={["base", "none"]}
          >
            <Checkbox checked={isSelected}/>
            <Image 
              source={ variantData.image?.url || variantData.product.featuredImage?.url }
              accessibilityDescription={ variantData.image?.altText || variantData.product.featuredImage?.altText }
              border="base"
              borderRadius="base"
              borderWidth="base"
            />
            <BlockStack>
              <Text>
                { variantData.product.title } { variantData.title === "Default Title" ? "" : " - " + variantData.title }
              </Text>
              <Text>
                { variantData.price.amount } { variantData.price.currencyCode }
              </Text>
            </BlockStack>
          </InlineLayout>
        </Pressable>
      </>
    );
  }