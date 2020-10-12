class Local {

  static readonly home = '/'
  static readonly addFile = '/add-file'
  static readonly blockchain = '/blockchain'
  static readonly about = '/about'
  static readonly help = '/help'
  static readonly faq = '/faq'
  static readonly blog = '/blog'
  static readonly contact = '/contact'

  static readonly file = '/file'
}

class Remote {

    static readonly secure = 'https://'
    static readonly insecure = 'http://'

    static readonly server = 'localhost'
    static readonly port = '21000'
}

export { Local, Remote }
