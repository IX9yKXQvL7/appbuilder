
const filesLib = require('@adobe/aio-lib-files')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils')

async function main (params) {
  const logger = Core.Logger('files-storage-upload', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Calling files-storage/upload action')
    logger.debug(stringParameters(params))

    const errorMessage = checkMissingRequestInputs(params, ['filename', 'fileData'], [])
    if (errorMessage) {
      return errorResponse(400, errorMessage, logger)
    }

    const { filename, fileData } = params
    const buffer = Buffer.from(fileData, 'base64')

    const files = await filesLib.init()
    await files.write(filename, buffer)

    logger.info(`File uploaded successfully: ${filename} (${buffer.length} bytes)`)

    return {
      statusCode: 200,
      body: {
        success: true,
        filename,
        size: buffer.length
      }
    }
  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'server error: ' + error.message, logger)
  }
}

exports.main = main
