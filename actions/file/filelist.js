const filesLib = require('@adobe/aio-lib-files')
const { Core } = require('@adobe/aio-sdk')
const { errorResponse, stringParameters } = require('../utils')

async function main (params) {
  const logger = Core.Logger('files-storage-list', { level: params.LOG_LEVEL || 'info' })

  try {
    logger.info('Calling files-storage/list action')
    logger.debug(stringParameters(params))

    const files = await filesLib.init()
    const fileList = await files.list('/')

    logger.info(`Listed ${fileList.length} file(s)`)

    return {
      statusCode: 200,
      body: {
        success: true,
        count: fileList.length,
        files: fileList
      }
    }
  } catch (error) {
    logger.error(error)
    return errorResponse(500, 'server error: ' + error.message, logger)
  }
}

exports.main = main
