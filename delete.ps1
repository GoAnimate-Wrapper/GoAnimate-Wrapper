Param (
	[Parameter(Mandatory)][int]$min,
	[int]$max = $min
)
for ($c = $min; $c -le $max; $c++) {
	Remove-Item ("_SAVED/movie-{0:d7}.xml" -f $c) -ErrorAction 'silentlycontinue'
	Remove-Item ("_SAVED/thumb-{0:d7}.png" -f $c) -ErrorAction 'silentlycontinue'
}