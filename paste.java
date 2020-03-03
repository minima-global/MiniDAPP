"<button>\n" + 
"<table>\n" + 
"	<tr>\n" + 
"		<td align=center><img width=50 src='./images/icon.png'></td>\n" + 
"	</tr>\n" + 
"	<tr>\n" + 
"		<td style='text-align:left;vertical-align:middle;'>MIFI LOGOUT</td>\n" + 
"	</tr>\n" + 
"</table>"

"LET pkcold = 0x876876876<br>\n" + 
"IF SIGNEDBY pkcold THEN RETURN TRUE ENDIF<br>\n" + 
"LET pkhot = 0x75765765765<br>\n" + 
"LET amt = GETSTATE ( 20 )<br>\n" + 
"LET recip = GETSTATE ( 21 )<br>\n" + 
"LET root = CONCAT ( [ IF SIGNEDBY ] SCRIPT ( pkcold ) [ THEN RETURN TRUE ENDIF ] )<br>\n" + 
"LET user = CONCAT ( [ IF SIGNEDBY ] SCRIPT ( recip ) [ AND ( @BLKNUM - @INBLKNUM ) GT 20 THEN RETURN TRUE ENDIF ] )<br>\n" + 
"LET final = CONCAT ( root user )<br>\n" + 
"ASSERT VERIFYOUT ( @INPUT SHA3 ( final ) amt @TOKENID )<br>\n" + 
"ASSERT VERIFYOUT ( ( @INPUT + 1 ) @ADDRESS ( @AMOUNT - amt ) @TOKENID )<br>\n" + 
"IF SIGNEDBY pkhot THEN RETURN TRUE ENDIF<br>"