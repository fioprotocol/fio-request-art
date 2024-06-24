#  FIO Request Art
This app looks for new FIO Requests and if it finds one, it will:
* For art@fio payer
  * Take its memo and use it to generate an image from Dall-e
  * Mint an NFT
* For handle@fio
  * Mint an NFT with https://metadata.fioprotocol.io/nftimage/${request.payee_fio_address}.svg using Netport
* Cancel the FIO Request