#!/bin/bash

usage ()
{

    echo "usage: $0 -d | --dir miniDappDirectory"

}

check () {

    while :
    do

        zip -r "${TMPFILE2}" "${BASEDIR}" >/dev/null 2>&1
        CHSUM2="$(sha1sum ${TMPFILE2} | awk '{print $1}')"
        CHSUM="${CHSUM2}"

        #echo "${CHSUM} and ${CHSUM2}"

        while [ "$CHSUM" = "$CHSUM2" ]
        do
            sleep 5
            zip -r "${TMPFILE}" "${BASEDIR}" >/dev/null 2>&1
            CHSUM="$(sha1sum ${TMPFILE} | awk '{print $1}')"

            #echo "${TMPFILE}"

            #echo "${CHSUM} and ${CHSUM2}"
        done

        #echo "Moving ${TMPFILE} to ${WORKINGDIR}"

        mv ${TMPFILE} ${WORKINGDIR} || exit 1
        rm ${TMPFILE2}

    done
}

cleanup ()
{
        #echo "Cleanup ${TMPFILE} ${TMPFILE2}"
        rm ${TMPFILE} >/dev/null 2>&1
        rm ${TMPFILE2} >/dev/null 2>&1
        exit 0
}

while [ $# -gt 0 ]
do

  case "$1" in

      "-d" | "--DIR" )  DIR="$2" ; shift 2;;
      * ) usage ; exit 1;;

  esac

done

WORKINGDIR="$( cd "$( dirname "${DIR}" )" >/dev/null 2>&1 && pwd )"
BASEDIR="$( basename "${DIR}" )"
ls ${WORKINGDIR}/${BASEDIR} >/dev/null 2>&1
if [ $? -ne 0 ]
then
        echo $WORKINGDIR
        usage
        exit 1
fi

# register signal handler
trap cleanup SIGINT;

TMPFILE="/tmp/${BASEDIR}.minidapp"
TMPFILE2="/tmp/${BASEDIR}2.minidapp"

cd "${WORKINGDIR}" || exit 1

check

exit 0
