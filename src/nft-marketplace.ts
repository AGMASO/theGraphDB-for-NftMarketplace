

//!Importamos estos dos protocolos de graph para poder definir los tipos con typescript.
import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListing as ItemListingEvent,
  UpdateListing as UpdateListingEvent
} from "../generated/NftMarketplace/NftMarketplace"

//Importaremos los objetos de ../generated/schema
import { ItemListing, ActiveItem, ItemCanceled, ItemBought,UpdateListing } from "../generated/schema"; 

export function handleItemListing(event: ItemListingEvent): void {
  //con esto tenemos el objeto cargado y con su unique ID
  let itemListing = ItemListing.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
// cargamos tambien el activeItem porque lo debemos update
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  //Ahora decimos: si no hay itemListing Object, crea uno nuevo
  if(!itemListing){

    itemListing = new ItemListing(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }
  //De igual forma, si no hay activeItem, crea uno nuevo

  if(!activeItem){
    activeItem = new ActiveItem(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }
  // ahora actualizamos los parametros con la info del evento.
  itemListing.seller = event.params.seller;
  itemListing.nftAddress = event.params.nftAddress;
  itemListing.price = event.params.price;
  itemListing.tokenId = event.params.tokenId;

  activeItem.seller = event.params.seller;
  activeItem.nftAddress = event.params.nftAddress;
  activeItem.price = event.params.price;
  activeItem.tokenId = event.params.tokenId;
  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000");

//Por ultimo salvamos estos objetos en la DB

itemListing.save();
activeItem.save();
}
//END

export function handleItemBought(event: ItemBoughtEvent): void {
//Esta es la funcion que se ejecuta cuando el evento triggers, ¿Que debemos hacer?
// Save el evento en la database = thegraph
// Update our activeItem

// Get or create ItemListed Object
//Each Item has a unique ID

//Tenemos que dos clases de cosas aqui. itemBoughtEvent = a raw data del evento
//Necesitamos crear/importar el Objeto itemBought que será el que tiene la estructura de objeto
//Lo importaremos de ../generated/schema

let itemBought = ItemBought.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

// Cargamos el activeItem, este ya va a existir, ya que cuando listamos un Item 
//Se agrega a activeItem
let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

//SI no existe, créalo
if(!itemBought){
  itemBought = new ItemBought(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
}

//Si ya existe, vamos a actualizarlo
itemBought.buyer = event.params.buyer;
itemBought.nftAddress = event.params.nftAddress;
itemBought.tokenId = event.params.tokenId;

//Ahora bien, deberemos actualizar el buyer del activeitem, para ello usamos ! de typsscript
//con el que indicamos que es un objeto que va a estar seguro, ya que para comprar un NFT
//primero debemos listarlo

activeItem!.buyer = event.params.buyer;

  itemBought.save();
  activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {


  let itemCanceled = ItemCanceled.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  if(!itemCanceled){

    itemCanceled = new ItemCanceled(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  }

  itemCanceled.seller = event.params.seller;
  itemCanceled.nftAddress = event.params.nftAddress;
  itemCanceled.tokenId = event.params.tokenId;

  //Añadiendole como buyer esta DEAD address, es como vamos a saber si un Nft ha sido
  //cancelado del nftMarketPlace
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD");

  itemCanceled.save();
  activeItem!.save();

}



export function handleUpdateListing(event: UpdateListingEvent): void {

  //con esto tenemos el objeto cargado y con su unique ID
  let updateListing = UpdateListing.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
// cargamos tambien el activeItem porque lo debemos update
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));

  //Ahora decimos: si no hay itemListing Object, crea uno nuevo
  if(!updateListing){

    updateListing = new UpdateListing(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }
  //De igual forma, si no hay activeItem, crea uno nuevo

  if(!activeItem){
    activeItem = new ActiveItem(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }
  // ahora actualizamos los parametros con la info del evento.
  updateListing.seller = event.params.seller;
  updateListing.nftAddress = event.params.nftAddress;
  updateListing.newPrice = event.params.newPrice;
  updateListing.tokenId = event.params.tokenId;

  
  activeItem.price = event.params.newPrice;
  

//Por ultimo salvamos estos objetos en la DB

updateListing.save();
activeItem!.save();
}

//Creamos una funcion para obtener el unique ID de cada objeto. Va a ser una combinacion
//del tokenId y de nftAddress
function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string{
  return tokenId.toHexString() + nftAddress.toHexString()
}