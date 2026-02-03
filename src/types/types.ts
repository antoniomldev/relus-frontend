export interface Rooms {
  id: string,
  occupation: number,
  capacity: number,
  name: string,
  keyOwner: string 
  status: RoomStatus;  
}

type RoomStatus = 'Disponível' | 'Cheio';

export interface Profile {
    id: string, 
    name: string,
    instagram: string, 
    qrCodeContent: string,
    teamName: string, //idealmente pode ser um novo tipo se quiser
    teamHexColor: string, //idealmente pode ser um novo tipo se quiser
    roomName: Rooms['name'] | 'Sem quarto'
    roomKeyOwner: Rooms['keyOwner'] | 'Sem proprietário'
    photo: string 
    district: string //idealmente pode ser um novo tipo se quiser
}