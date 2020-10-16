class Local {

  static readonly home = '/'
  static readonly blockchain = '/blockchain'
  static readonly about = '/about'
  static readonly help = '/help'
  static readonly faq = '/faq'
  static readonly blog = '/blog'
  static readonly contact = '/contact'

  static readonly listFiles = '/list-files'
  static readonly addFile = '/add-file'
  static readonly addChecked = '/add-checked-file'
  static readonly addCheckedFile = '/add-checked-file/:fileName/:hash'
  static readonly checkFile = '/check-file'
}

class Remote {

    static readonly secure = 'https://'
    static readonly insecure = 'http://'

    static readonly server = 'localhost'
    static readonly port = '9004'
}

export { Local, Remote }
